resource "kubernetes_persistent_volume" "docker_data" {
  metadata {
    name = "${var.twentycrm_app_name}-docker-data-pv"
  }
  spec {
    storage_class_name = "default"
    capacity = {
      storage = var.twentycrm_docker_data_pv_capacity
    }
    access_modes = ["ReadWriteOnce"]
    # refer to Terraform Docs for your specific implementation requirements
    # https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/persistent_volume
    persistent_volume_source {
      local {
        path = var.twentycrm_docker_data_pv_path
      }
    }
  }
}
