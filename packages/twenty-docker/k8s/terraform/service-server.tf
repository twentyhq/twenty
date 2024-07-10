resource "kubernetes_service" "twentycrm_server" {
  metadata {
    name      = "${local.twentycrm_app_name}-server"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${local.twentycrm_app_name}-server"
    }
    session_affinity = "ClientIP"
    port {
      name        = "http-tcp"
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}
